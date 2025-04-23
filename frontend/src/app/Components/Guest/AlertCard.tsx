import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VendorAlertProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  vendors: { id: string; title: string; minGuestLimit: number }[];
}

export const VendorAlertDialog = ({ open, setOpen, vendors }: VendorAlertProps) => (
  <AlertDialog  open={open} onOpenChange={setOpen}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="text-gray-100">
          Catering Vendor Notice
        </AlertDialogTitle>
        <AlertDialogDescription className="text-gray-200">
          Guests have been removed, but some catering vendor budgets were
          preserved due to minimum guest requirements:
        </AlertDialogDescription>
        <div className="space-y-3 mt-3">
          <ul className="list-disc pl-5 space-y-1">
            {vendors.map((vendor) => (
              <li key={vendor.id} className="text-gray-300">
                <span className="font-medium">{vendor.title}</span>: Minimum{" "}
                {vendor.minGuestLimit} guests required
              </li>
            ))}
          </ul>
        </div>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction>Understood</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
