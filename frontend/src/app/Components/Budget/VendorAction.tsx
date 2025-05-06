import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { VendorType } from "@/Interface/interface";
import { sendMailToVendor } from "@/store/vendorSlice";

// UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { MoreVertical } from "lucide-react";

interface VendorActionsProps {
  item: VendorType;
  onRemove: (id: string) => void;
}

interface MailFormValues {
  notes: string;
  isNegotiating: boolean;
  negotiatedPrice: number;
}

const VendorActions = ({ item, onRemove }: VendorActionsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isMailDialogOpen, setIsMailDialogOpen] = useState(false);

  const form = useForm<MailFormValues>({
    defaultValues: {
      notes: "",
      isNegotiating: false,
      negotiatedPrice: item.price,
    },
  });

  const handleSendMail = async (values: MailFormValues) => {
    try {
      // Single dispatch that includes all the necessary information
      // Backend will determine if it's a negotiation or regular mail based on isNegotiating flag
      await dispatch(
        sendMailToVendor({
          vendorId: item._id as string,
          eventId: item.event,
          notes: values.notes,
          isNegotiating: values.isNegotiating,
          negotiatedPrice: values.isNegotiating
            ? values.negotiatedPrice
            : undefined,
        })
      );

      setIsMailDialogOpen(false);
      form.reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsMailDialogOpen(true)}>
            Send Mail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRemove(item._id as string)}>
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mail Dialog */}
      <Dialog open={isMailDialogOpen} onOpenChange={setIsMailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Vendor</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSendMail)}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <p className="font-medium">Original Price:</p>
                <p className="text-gray-200">₹{item.price}</p>
              </div>

              <FormField
                control={form.control}
                name="isNegotiating"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Add Negotiated Price?
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch("isNegotiating") && (
                <FormField
                  control={form.control}
                  name="negotiatedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposed Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter your proposed price"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes/Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any details or requests here..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="sm:justify-end">
                <Button
                  type="button"
                  className="text-black"
                  variant="outline"
                  onClick={() => setIsMailDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Send</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendorActions;
