import { useNostr } from "@nostrify/react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { useCurrentUser } from "./useCurrentUser";
import { useCurrentRelays } from "./useCurrentRelays";
import { useNetwork } from "@/contexts/NetworkContext";
import { ANGOR_RELAY_POOL } from "@/types/angor";

import type { NostrEvent } from "@nostrify/nostrify";

export function useNostrPublish(): UseMutationResult<NostrEvent, Error, Omit<NostrEvent, 'id' | 'pubkey' | 'sig'>, unknown> {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { writableUrls, allRelays } = useCurrentRelays();
  const { network } = useNetwork();

  return useMutation({
    mutationFn: async (t: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'>) => {
      if (!user) {
        throw new Error("User is not logged in");
      }

      const tags = t.tags ?? [];

      // Add the client tag if it doesn't exist
      if (location.protocol === "https:" && !tags.some(([name]) => name === "client")) {
        tags.push(["client", location.hostname]);
      }

      const event = await user.signer.signEvent({
        kind: t.kind,
        content: t.content ?? "",
        tags,
        created_at: t.created_at ?? Math.floor(Date.now() / 1000),
      });

      // Get user's configured relays
      const userWritableUrls = writableUrls;
      const userAllRelayUrls = allRelays.filter(relay => relay.status === 'connected').map(relay => relay.url);
      
      // Get Angor protocol relays for the current network
      const angorRelays = ANGOR_RELAY_POOL[network] || ANGOR_RELAY_POOL.mainnet;
      
      // Combine all relay sources for maximum reach
      const targetRelays = Array.from(new Set([
        ...userWritableUrls,        // User's writable relays
        ...userAllRelayUrls,        // All user's connected relays
        ...angorRelays              // Angor protocol relays
      ]));

      console.log(`🚀 Publishing event kind ${event.kind} to ${targetRelays.length} relays:`, {
        userWritable: userWritableUrls.length,
        userAll: userAllRelayUrls.length,
        angor: angorRelays.length,
        total: targetRelays.length,
        relays: targetRelays
      });

      // Publish to all target relays with individual error handling
      const publishPromises = targetRelays.map(async (relayUrl) => {
        try {
          await nostr.event(event, { signal: AbortSignal.timeout(15000) });
          console.log(`✅ Published to ${relayUrl}`);
          return { relayUrl, success: true };
        } catch (error) {
          console.error(`❌ Failed to publish to ${relayUrl}:`, error);
          return { relayUrl, success: false, error };
        }
      });

      // Wait for all publishing attempts
      const results = await Promise.allSettled(publishPromises);
      
      const successResults = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      );
      const successCount = successResults.length;

      console.log(`📡 Event published to ${successCount}/${targetRelays.length} relays`);

      // If at least one relay succeeded, consider it successful
      if (successCount > 0) {
        return event;
      } else {
        throw new Error(`Failed to publish to any relay. Tried ${targetRelays.length} relays.`);
      }
    },
    onError: (error) => {
      console.error("Failed to publish event:", error);
    },
    onSuccess: (data) => {
      console.log("Event published successfully:", data);
    },
  });
}