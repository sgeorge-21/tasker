import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ServiceSelectionModalProps {
  open: boolean;
  serviceName: string | null;
  onClose: () => void;
  onRequestQuotation: () => void;
  onRequestService: () => void;
}

export const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({
  open,
  serviceName,
  onClose,
  onRequestQuotation,
  onRequestService,
}) => {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="w-full sm:max-w-md mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>How would you like to proceed?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-gray-600">You selected: <span className="font-semibold">{serviceName}</span></p>
          <div className="space-y-3">
            <Button
              onClick={onRequestQuotation}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 text-base font-semibold"
            >
              <div className="text-center">
                <div>Request for Quotation</div>
                <div className="text-sm font-normal">$2.00</div>
              </div>
            </Button>
            <Button
              onClick={onRequestService}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold"
            >
              Request for Service
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
