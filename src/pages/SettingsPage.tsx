import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Palette, 
  Wifi, 
  Trash2,
  Plus,
  X,
  Check,
  Globe,
  Server,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useNetwork } from '@/contexts/NetworkContext';
import { useIndexer } from '@/contexts/IndexerContext';
import { IndexerTestingService } from '@/services/indexerTesting';
import { useRelay } from '@/hooks/useRelay';
import { useSettings } from '@/hooks/useSettings';
import { NetworkSelector } from '@/components/NetworkSelector';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { network } = useNetwork();
  const { 
    indexers, 
    addIndexer, 
    removeIndexer, 
    setPrimaryIndexer, 
    resetToDefaults
  } = useIndexer();
  
  const {
    relays,
    addRelay: addRelayToContext,
    removeRelay: removeRelayFromContext,
    toggleRelayPermission: toggleRelayPermissionInContext,
    connectToRelay,
    disconnectFromRelay,
    resetToDefaults: resetRelaysToDefaults,
    testRelayConnection
  } = useRelay();
  
  const { settings, updateSetting } = useSettings();
  
  const [newRelay, setNewRelay] = useState('');
  const [newIndexer, setNewIndexer] = useState('');
  const [testingIndexers, setTestingIndexers] = useState<Set<string>>(new Set());
  const [testingRelays, setTestingRelays] = useState<Set<string>>(new Set());
  const [resettingRelays, setResettingRelays] = useState(false);
  const [indexerTestResults, setIndexerTestResults] = useState<Map<string, { isOnline: boolean; statusText: string; responseTime: number }>>(new Map());

  const addNewRelay = async () => {
    if (!newRelay.trim()) return;
    
    try {
      const success = addRelayToContext(newRelay.trim(), network);
      if (success) {
        setNewRelay('');
        toast({
          title: "Relay added",
          description: "New relay has been added to your list",
        });
      } else {
        toast({
          title: "Failed to add relay",
          description: "This relay already exists in your list",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Failed to add relay:', err);
      toast({
        title: "Failed to add relay",
        description: "Unable to add relay",
        variant: "destructive"
      });
    }
  };

  const removeRelayHandler = (url: string) => {
    removeRelayFromContext(url, network);
    toast({
      title: "Relay removed",
      description: "Relay has been removed from your list",
    });
  };

  const toggleRelayPermissionHandler = (url: string, type: 'read' | 'write') => {
    toggleRelayPermissionInContext(url, network, type);
    toast({
      title: "Permission updated",
      description: `${type} permission has been toggled for this relay`,
    });
  };

  const testRelay = async (url: string) => {
    setTestingRelays(prev => new Set([...prev, url]));
    
    try {
      const isOnline = await testRelayConnection(url);
      toast({
        title: isOnline ? "Connection successful" : "Connection failed",
        description: isOnline 
          ? "Relay is online and responding" 
          : "Relay is not responding",
        variant: isOnline ? "default" : "destructive"
      });
    } catch (err) {
      console.error('Test relay error:', err);
      toast({
        title: "Connection test failed",
        description: "Unable to test relay connection",
        variant: "destructive"
      });
    } finally {
      setTestingRelays(prev => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
    }
  };

  const connectRelayHandler = async (url: string) => {
    try {
      await connectToRelay(url, network);
      toast({
        title: "Relay connected",
        description: "Successfully connected to relay",
      });
    } catch (err) {
      console.error('Connect relay error:', err);
      toast({
        title: "Connection failed",
        description: "Unable to connect to relay",
        variant: "destructive"
      });
    }
  };

  const disconnectRelayHandler = async (url: string) => {
    try {
      disconnectFromRelay(url, network);
      toast({
        title: "Relay disconnected",
        description: "Successfully disconnected from relay",
      });
    } catch (err) {
      console.error('Disconnect relay error:', err);
      toast({
        title: "Disconnection failed",
        description: "Unable to disconnect from relay",
        variant: "destructive"
      });
    }
  };

  const resetRelaysToDefaultsHandler = async () => {
    setResettingRelays(true);
    try {
      await resetRelaysToDefaults();
      toast({
        title: "Relays reset",
        description: "All relays have been reset to default values and reconnected",
      });
    } catch (error) {
      console.error('Reset relays error:', error);
      toast({
        title: "Reset failed",
        description: "Unable to reset relays to defaults",
        variant: "destructive"
      });
    } finally {
      setResettingRelays(false);
    }
  };

  const addNewIndexer = async () => {
    if (!newIndexer.trim()) return;
    
    const success = addIndexer(newIndexer.trim(), network);
    if (success) {
      setNewIndexer('');
      toast({
        title: "Indexer added",
        description: "New indexer has been added to your list",
      });
    } else {
      toast({
        title: "Failed to add indexer",
        description: "This indexer already exists in your list",
        variant: "destructive"
      });
    }
  };

  const removeIndexerHandler = (url: string) => {
    removeIndexer(url, network);
    toast({
      title: "Indexer removed",
      description: "Indexer has been removed from your list",
    });
  };

  const setPrimaryIndexerHandler = (url: string) => {
    setPrimaryIndexer(url, network);
    toast({
      title: "Primary indexer changed",
      description: "Primary indexer has been updated",
    });
  };

  const testIndexer = async (url: string) => {
    setTestingIndexers(prev => new Set([...prev, url]));
    
    try {
      console.log(`🔍 Starting test for: ${url}`);
      const result = await IndexerTestingService.testWithRetry(url);
      console.log(`📊 Test completed:`, result);
      
      // Update test results
      setIndexerTestResults(prev => new Map(prev).set(url, {
        isOnline: result.isOnline,
        statusText: result.statusText || (result.isOnline ? 'Online' : 'Offline'),
        responseTime: result.responseTime
      }));
      
    } catch (err) {
      console.error('Test indexer error:', err);
      
      // Update test results with error
      setIndexerTestResults(prev => new Map(prev).set(url, {
        isOnline: false,
        statusText: 'Test Error',
        responseTime: 0
      }));
    } finally {
      setTestingIndexers(prev => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
    }
  };

  const resetIndexersToDefaults = () => {
    resetToDefaults();
    toast({
      title: "Indexers reset",
      description: "All indexers have been reset to default values",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your Angor Hub experience</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="indexers">Indexers</TabsTrigger>
            <TabsTrigger value="relays">Relays</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Platform Preferences
                </CardTitle>
                <CardDescription>
                  Configure default platform settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label>Default Currency Display</Label>
                    <p className="text-sm text-muted-foreground">
                      How Bitcoin amounts are displayed
                    </p>
                  </div>
                  <Select 
                    value={settings.defaultCurrency} 
                    onValueChange={(value: 'sats' | 'btc') => updateSetting('defaultCurrency', value)}
                  >
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sats">Sats</SelectItem>
                      <SelectItem value="btc">BTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground">
                      Interface language
                    </p>
                  </div>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label>Auto-connect to Relays</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically connect to relays when app starts
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoConnect}
                    onCheckedChange={(checked) => updateSetting('autoConnect', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Indexers Settings */}
          <TabsContent value="indexers" className="space-y-6">
            {/* Network Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Network Selection
                </CardTitle>
                <CardDescription>
                  Choose the Bitcoin network for indexer connections. This affects which project data is displayed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label>Current Network</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between Bitcoin Mainnet and Testnet networks
                    </p>
                  </div>
                  <NetworkSelector variant="full" />
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Bitcoin Indexers - {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
                </CardTitle>
                <CardDescription>
                  Manage Bitcoin indexer endpoints for {network} network. These indexers provide project data and statistics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Indexer */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="https://indexer.example.com/"
                    value={newIndexer}
                    onChange={(e) => setNewIndexer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewIndexer()}
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={addNewIndexer} 
                      disabled={!newIndexer.trim()}
                      className="flex-1 sm:flex-none"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                    <Button 
                      onClick={resetIndexersToDefaults} 
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Indexer List */}
                <div className="space-y-3">
                  {indexers[network].map((indexer) => (
                    <div
                      key={indexer.url}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg ${
                        indexer.isPrimary ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <p className="font-medium truncate">{indexer.url}</p>
                          <div className="flex items-center gap-2">
                            {indexer.isPrimary && (
                              <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded whitespace-nowrap">
                                Primary
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {indexer.isPrimary ? 'Active indexer for data queries' : 'Backup indexer'}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testIndexer(indexer.url)}
                            disabled={testingIndexers.has(indexer.url)}
                            className="flex-shrink-0"
                          >
                            {testingIndexers.has(indexer.url) ? (
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <AlertCircle className="w-3 h-3 mr-1" />
                            )}
                            Test
                          </Button>
                          
                          {/* Test Result Status */}
                          {indexerTestResults.has(indexer.url) && (
                            <div className="flex items-center gap-1 text-sm">
                              {indexerTestResults.get(indexer.url)?.isOnline ? (
                                <>
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  <span className="text-green-600">Online</span>
                                  <span className="text-muted-foreground">
                                    ({indexerTestResults.get(indexer.url)?.responseTime}ms)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                  <span className="text-red-600">
                                    {indexerTestResults.get(indexer.url)?.statusText || 'Offline'}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                          
                          {!indexer.isPrimary && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPrimaryIndexerHandler(indexer.url)}
                              className="flex-shrink-0 whitespace-nowrap"
                            >
                              Set Primary
                            </Button>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeIndexerHandler(indexer.url)}
                          className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                          disabled={indexers[network].length === 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {indexers[network].length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No Indexers Available</h3>
                    <p className="text-muted-foreground mb-4">
                      Add at least one indexer to fetch project data.
                    </p>
                    <Button onClick={resetIndexersToDefaults}>
                      Reset to Defaults
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relays Settings */}
          <TabsContent value="relays" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Nostr Relays
                </CardTitle>
                <CardDescription>
                  Manage your Nostr relay connections for publishing and receiving events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Relay */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="wss://relay.example.com"
                    value={newRelay}
                    onChange={(e) => setNewRelay(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewRelay()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={addNewRelay} 
                    disabled={!newRelay}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Relay
                  </Button>
                </div>

                <Separator />

                {/* Current Network Display */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <span>Managing relays for: <strong className="capitalize">{network}</strong></span>
                </div>

                {/* Relay List */}
                <div className="space-y-3">
                  {relays[network].map((relay) => (
                    <div
                      key={relay.url}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(relay.status)} flex-shrink-0`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <p className="font-medium truncate">{relay.url}</p>
                            <div className="flex items-center gap-2">
                                                  <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full capitalize whitespace-nowrap">
                                {relay.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mobile: Stack controls vertically, Desktop: Horizontal */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        {/* Row 1: Connection + Test */}
                        <div className="flex gap-2">
                          {/* Connection Controls */}
                          {relay.status === 'disconnected' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => connectRelayHandler(relay.url)}
                              disabled={testingRelays.has(relay.url)}
                              className="flex-1 sm:flex-none"
                            >
                              {testingRelays.has(relay.url) ? (
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <Wifi className="w-3 h-3 mr-1" />
                              )}
                              </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => disconnectRelayHandler(relay.url)}
                              className="flex-1 sm:flex-none"
                            >
                              <X className="w-3 h-3 mr-1" />
                              </Button>
                          )}

                          {/* Test Connection */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testRelay(relay.url)}
                            disabled={testingRelays.has(relay.url)}
                            className="flex-shrink-0"
                          >
                            {testingRelays.has(relay.url) ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                          </Button>
                        </div>

                        {/* Row 2: Permissions + Remove */}
                        <div className="flex gap-2">
                          {/* Read Permission */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRelayPermissionHandler(relay.url, 'read')}
                            className={`flex-1 sm:flex-none ${relay.read ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                          >
                            {relay.read ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                            Read
                          </Button>
                          
                          {/* Write Permission */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRelayPermissionHandler(relay.url, 'write')}
                            className={`flex-1 sm:flex-none ${relay.write ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                          >
                            {relay.write ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                            Write
                          </Button>
                          
                          {/* Remove Relay */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeRelayHandler(relay.url)}
                            className="text-red-600 hover:text-red-700 flex-shrink-0"
                            disabled={relay.isDefault || relays[network].length === 1}
                          >
                            <Trash2 className="w-3 h-3" />
                           </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reset to Defaults */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t">
                  <div>
                    <p className="font-medium">Reset to Defaults</p>
                    <p className="text-sm text-muted-foreground">
                      Restore the default relay configuration for {network}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={resetRelaysToDefaultsHandler}
                    disabled={resettingRelays}
                    className="text-orange-600 hover:text-orange-700 w-full sm:w-auto"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${resettingRelays ? 'animate-spin' : ''}`} />
                    {resettingRelays ? 'Resetting...' : 'Reset'}
                  </Button>
                </div>

                {relays[network].length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No Relays Available</h3>
                    <p className="text-muted-foreground mb-4">
                      Add at least one relay to connect to the Nostr network.
                    </p>
                    <Button 
                      onClick={resetRelaysToDefaultsHandler}
                      disabled={resettingRelays}
                    >
                      {resettingRelays ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        'Reset to Defaults'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
        <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
      </div>
      
      {/* Tabs Skeleton */}
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex border-b border-border space-x-2">
          <div className="h-10 w-20 bg-muted animate-pulse rounded-t-md" />
          <div className="h-10 w-24 bg-muted/50 animate-pulse rounded-t-md" />
          <div className="h-10 w-20 bg-muted/50 animate-pulse rounded-t-md" />
        </div>
        
        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Theme Settings Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-6 w-11 bg-muted animate-pulse rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
              </div>
            </CardContent>
          </Card>
          
          {/* Network Settings Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                <div className="h-6 w-28 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-56 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-9 w-40 bg-muted animate-pulse rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-9 w-full bg-muted animate-pulse rounded-md" />
              </div>
            </CardContent>
          </Card>
          
          {/* Relay Settings Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-44 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-11 bg-muted animate-pulse rounded-full" />
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
              <div className="h-9 w-28 bg-primary/20 animate-pulse rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
