-- Enforce payment status rule: Paid invoices can never be changed back to Pending or any other status.

CREATE OR REPLACE FUNCTION prevent_paid_invoice_status_reversal()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent reversing status from Paid to anything else
    IF OLD.payment_status = 'Paid' AND NEW.payment_status != 'Paid' THEN
        RAISE EXCEPTION 'Paid invoices cannot be changed back to Pending or another status.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_paid_status_reversal ON public.invoices;

CREATE TRIGGER trigger_prevent_paid_status_reversal
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION prevent_paid_invoice_status_reversal();
