import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Textarea, Field } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useUpsertContract, useDeleteContract } from './queries'
import { toast } from '@/stores/toast'
import type { Contract } from '@/types/database'

interface ContractDialogProps {
  open: boolean
  onClose: () => void
  initial?: Contract | null
}

export function ContractDialog({ open, onClose, initial }: ContractDialogProps) {
  const [clientName, setClientName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [monthlyValue, setMonthlyValue] = useState('0')
  const [totalValue, setTotalValue] = useState('')
  const [bindingMonths, setBindingMonths] = useState('')
  const [noticeMonths, setNoticeMonths] = useState('')
  const [note, setNote] = useState('')

  const upsert = useUpsertContract()
  const del = useDeleteContract()

  useEffect(() => {
    if (!open) return
    setClientName(initial?.client_name ?? '')
    setStartDate(initial?.start_date ?? '')
    setEndDate(initial?.end_date ?? '')
    setMonthlyValue(String(initial?.monthly_value ?? 0))
    setTotalValue(initial?.total_value != null ? String(initial.total_value) : '')
    setBindingMonths(initial?.binding_months != null ? String(initial.binding_months) : '')
    setNoticeMonths(initial?.notice_months != null ? String(initial.notice_months) : '')
    setNote(initial?.note ?? '')
  }, [open, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !startDate || !endDate) {
      toast.error('Kund, startdatum och slutdatum krävs')
      return
    }
    const parseNum = (v: string) => (v.trim() === '' ? null : Number(v))
    try {
      await upsert.mutateAsync({
        ...(initial?.id ? { id: initial.id } : {}),
        client_name: clientName.trim(),
        start_date: startDate,
        end_date: endDate,
        monthly_value: Number(monthlyValue) || 0,
        total_value: parseNum(totalValue),
        binding_months: parseNum(bindingMonths),
        notice_months: parseNum(noticeMonths),
        note: note || null,
      })
      toast.success(initial ? 'Avtal uppdaterat' : 'Avtal skapat')
      onClose()
    } catch (err) {
      toast.error('Något gick fel', err instanceof Error ? err.message : undefined)
    }
  }

  const handleDelete = async () => {
    if (!initial) return
    if (!confirm(`Ta bort avtalet för ${initial.client_name}?`)) return
    try {
      await del.mutateAsync(initial.id)
      toast.success('Avtal borttaget')
      onClose()
    } catch (err) {
      toast.error('Kunde inte ta bort', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? 'Redigera avtal' : 'Nytt avtal'}
      size="lg"
      footer={
        <>
          {initial && (
            <Button variant="ghost" onClick={handleDelete} className="text-[var(--color-danger)] mr-auto">
              Ta bort
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Avbryt
          </Button>
          <Button form="contract-form" type="submit" variant="primary" disabled={upsert.isPending}>
            {upsert.isPending ? 'Sparar…' : initial ? 'Spara' : 'Skapa'}
          </Button>
        </>
      }
    >
      <form id="contract-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Field label="Kund" className="col-span-2">
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            autoFocus
          />
        </Field>
        <Field label="Startdatum">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </Field>
        <Field label="Slutdatum">
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </Field>
        <Field label="Månadsvärde (kr)">
          <Input
            type="number"
            min="0"
            value={monthlyValue}
            onChange={(e) => setMonthlyValue(e.target.value)}
          />
        </Field>
        <Field label="Totalvärde (kr)">
          <Input
            type="number"
            min="0"
            value={totalValue}
            onChange={(e) => setTotalValue(e.target.value)}
          />
        </Field>
        <Field label="Bindningstid (mån)">
          <Input
            type="number"
            min="0"
            value={bindingMonths}
            onChange={(e) => setBindingMonths(e.target.value)}
          />
        </Field>
        <Field label="Uppsägningstid (mån)">
          <Input
            type="number"
            min="0"
            value={noticeMonths}
            onChange={(e) => setNoticeMonths(e.target.value)}
          />
        </Field>
        <Field label="Anteckning" className="col-span-2">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </form>
    </Dialog>
  )
}
