import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initialize toast
export const showToast = (message, type = 'info') => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warn':
      toast.warn(message);
      break;
    default:
      toast.info(message);
  }
};
