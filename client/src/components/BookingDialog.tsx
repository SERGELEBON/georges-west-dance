import { useState } from "react";
import { ArrowRight, LoaderCircle, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type BookingDialogProps = {
  activity?: string;
  slot?: string;
  children: React.ReactNode;
};

type BookingForm = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const initialForm: BookingForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export function BookingDialog({
  activity = "General booking enquiry",
  slot,
  children,
}: BookingDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const updateField = (field: keyof BookingForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSubmitted(false);
      submitContact.reset();
    }
  };

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitContact.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      activity,
      slot: slot || undefined,
      message: form.message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="booking-dialog">
        <DialogHeader className="booking-dialog-header">
          <p className="eyebrow"><span className="gold-dot" /> Georges West Dance / Enquiry desk</p>
          <DialogTitle>{t("Make the first move.")}</DialogTitle>
          <DialogDescription>
            {t("Tell us where you want to begin. The studio will reply with the right format and next available step.")}
          </DialogDescription>
        </DialogHeader>

        <div className="booking-dialog-route">
          <span>{t("Selected activity")}</span>
          <strong>{activity}</strong>
          {slot && <small>{slot}</small>}
        </div>

        {submitted ? (
          <div className="booking-dialog-success" role="status">
            <span className="booking-dialog-success-mark">✓</span>
            <div>
              <strong>{t("Thank you,")} {form.name.split(" ")[0]}.</strong>
              <p>{t("Your enquiry is on its way to the Georges West Dance team. We’ll reply soon with your next count.")}</p>
            </div>
            <button className="dark-button" type="button" onClick={() => handleOpenChange(false)}>{t("Close")} <ArrowRight size={15} /></button>
          </div>
        ) : (
          <form className="booking-dialog-form" onSubmit={submitForm}>
            <div className="booking-dialog-grid">
              <label>{t("Full name")}<input required value={form.name} onChange={event => updateField("name", event.target.value)} placeholder="Your name" autoComplete="name" /></label>
              <label>{t("Email address")}<input required type="email" value={form.email} onChange={event => updateField("email", event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
            </div>
            <label>{t("Phone / WhatsApp")}<input value={form.phone} onChange={event => updateField("phone", event.target.value)} placeholder="+233 ..." autoComplete="tel" /></label>
            <label>{t("What would you like to work on?")}<textarea required minLength={10} rows={4} value={form.message} onChange={event => updateField("message", event.target.value)} placeholder={t("Tell us about your goals, availability or preferred format.")} /></label>
            <button className="dark-button booking-dialog-submit" type="submit" disabled={submitContact.isPending}>
              {submitContact.isPending ? <LoaderCircle className="loading-icon" size={16} /> : <Send size={15} />}
              {submitContact.isPending ? t("Sending securely...") : t("Send enquiry")}
              {!submitContact.isPending && <ArrowRight size={15} />}
            </button>
            {submitContact.isError && <p className="form-error" role="alert">We could not send your enquiry. Please try again or use WhatsApp.</p>}
            <p className="form-note">{t("Your message is sent securely to the Georges West Dance team.")}</p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
