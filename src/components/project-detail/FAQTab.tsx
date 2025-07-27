import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import type { NostrFAQItem } from '@/types/angor';

export function FAQTabSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-64 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
              </div>
              {i < 3 && <div className="h-px w-full bg-muted" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface AdditionalData {
  faq?: NostrFAQItem[];
}

interface FAQTabProps {
  additionalData?: AdditionalData;
}

export function FAQTab({ additionalData }: FAQTabProps) {
  return (
    <div className="space-y-6">
      {(additionalData?.faq && Array.isArray(additionalData.faq) && additionalData.faq.length > 0) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(additionalData.faq as NostrFAQItem[]).map((item: NostrFAQItem, index: number) => (
              <div key={index}>
                <h4 className="font-medium mb-3 text-base sm:text-lg">
                  {item?.question || `Question ${index + 1}`}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {item?.answer || 'No answer provided'}
                </p>
                {index < (additionalData.faq as NostrFAQItem[]).length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No FAQ Available</h3>
            <p className="text-muted-foreground">
              The project creator hasn't provided FAQ information yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
