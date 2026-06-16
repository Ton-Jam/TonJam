import { toast } from 'sonner';

export const showTransactionToast = (message: string) => {
  toast.success(message, {
    description: 'Transaction processed successfully.',
  });
};

export const showBidToast = (message: string) => {
  toast.info(message, {
    description: 'Bid submitted successfully.',
  });
};

export const showSocialToast = (message: string) => {
  toast.message(message, {
    description: 'Social interaction updated.',
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    description: 'An error occurred.',
  });
};
