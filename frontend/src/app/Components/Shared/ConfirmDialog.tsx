import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmClassName?: string;
};

const ConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you absolutely sure?",
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  confirmClassName = "bg-red-600 hover:bg-red-700",
}: ConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-300">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400 font-semibold">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-black cursor-pointer">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction className={confirmClassName} onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
