import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminInquiries, type Inquiry } from "@/hooks/useAdminBookings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageSquare, Phone, Mail, Trash2, Eye, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";


const statusColors: Record<string, string> = {
  new: "bg-red-100 text-red-800 border-red-200",
  read: "bg-blue-100 text-blue-800 border-blue-200",
  replied: "bg-green-100 text-green-800 border-green-200",
};

const isNewInquiryStatus = (status?: string | null) =>
  ["unread", "pending", "synced", "sync_failed"].includes((status || "").toLowerCase());

const getDisplayStatus = (status?: string | null) => {
  if (isNewInquiryStatus(status)) return "new";
  if ((status || "").toLowerCase() === "replied") return "replied";
  return "read";
};

export const AdminInquiries = () => {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const queryClient = useQueryClient();

  const { data: inquiries = [], isLoading: loading } = useAdminInquiries();


  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("inquiry_submissions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["unread-inquiries-count"] });
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      const { error } = await supabase
        .from("inquiry_submissions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Inquiry deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["unread-inquiries-count"] });
    } catch (err) {
      toast.error("Failed to delete inquiry");
    }
  };

  const handleView = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    if (isNewInquiryStatus(inq.status)) {
      updateStatus(inq.id, "read");
    }
  };

  const handleWhatsAppReply = (inq: Inquiry) => {
    const phone = inq.phone?.replace(/\D/g, "");
    if (!phone) {
      toast.error("No phone number available for this customer");
      return;
    }

    const message = `Hello ${inq.full_name}, this is Tambua Africa. We received your inquiry regarding "${inq.subject || inq.safari_title || "Safari"}". How can we help you further?`;
    const whatsappUrl = `https://wa.me/${phone.startsWith('254') ? phone : '254' + phone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, "_blank");
    updateStatus(inq.id, "replied");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-bold">User Messages & Inquiries</h2>
          <p className="text-muted-foreground text-sm">Manage entries from contact forms and booking requests.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Badge variant="outline" className="shrink-0 px-3 py-1">
            Total: {inquiries.length}
          </Badge>
          <Badge className="shrink-0 bg-red-500 px-3 py-1 hover:bg-red-600">
            New: {inquiries.filter(i => isNewInquiryStatus(i.status)).length}
          </Badge>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject/Safari</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inq) => (
              <TableRow key={inq.id} className="hover:bg-muted/30">
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(inq.created_at), "MMM d, HH:mm")}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{inq.full_name}</div>
                  <div className="text-xs text-muted-foreground">{inq.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {inq.inquiry_type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm">
                  {inq.subject || inq.safari_title || "General Inquiry"}
                </TableCell>
                <TableCell>
                  <Badge className={`${statusColors[getDisplayStatus(inq.status)]} border text-[10px] capitalize`}>
                    {getDisplayStatus(inq.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-accent"
                      onClick={() => handleView(inq)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleWhatsAppReply(inq)}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteInquiry(inq.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No inquiries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2 pb-2 border-b border-border">
                  <p className="text-muted-foreground font-medium mb-1 truncate">Status</p>
                  <Badge className={`${statusColors[getDisplayStatus(selectedInquiry.status)]} capitalize`}>
                    {getDisplayStatus(selectedInquiry.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium truncate">Customer</p>
                  <p className="text-foreground">{selectedInquiry.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium truncate">Date</p>
                  <p className="text-foreground font-mono text-xs">
                    {format(new Date(selectedInquiry.created_at), "yyyy-MM-dd HH:mm:ss")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium truncate">Email</p>
                  <p className="text-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {selectedInquiry.email}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium truncate">Phone</p>
                  <p className="text-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedInquiry.phone || "N/A"}
                  </p>
                </div>
                {selectedInquiry.inquiry_type === "booking" && (
                  <>
                    <div className="col-span-2 mt-2 pt-2 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground">Trip details</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium truncate">Safari</p>
                      <p className="text-foreground">{selectedInquiry.safari_title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium truncate">Date</p>
                      <p className="text-foreground">{selectedInquiry.preferred_date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium truncate">Guests</p>
                      <p className="text-foreground">{selectedInquiry.guests}</p>
                    </div>
                  </>
                )}
                <div className="col-span-2 pt-2 border-t border-border">
                  <p className="text-muted-foreground font-medium mb-1 truncate">Subject</p>
                  <p className="text-foreground font-semibold">{selectedInquiry.subject || selectedInquiry.safari_title || "General Inquiry"}</p>
                </div>
                <div className="col-span-2 pt-2">
                  <p className="text-muted-foreground font-medium mb-1 truncate">Message</p>
                  <div className="p-3 bg-muted/50 rounded-xl text-sm italic border border-border whitespace-pre-wrap">
                    "{selectedInquiry.message || "No message provided."}"
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setSelectedInquiry(null)}>Close</Button>
            <div className="flex gap-2">
               <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => selectedInquiry && handleWhatsAppReply(selectedInquiry)}
              >
                <Phone className="w-4 h-4 mr-2" /> WhatsApp Reply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
