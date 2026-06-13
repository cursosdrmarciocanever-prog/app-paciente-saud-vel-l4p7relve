import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import pb from '@/lib/pocketbase/client'

export function PatientAutocomplete({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedName, setSelectedName] = useState<string>('')

  useEffect(() => {
    if (value && !selectedName) {
      pb.collection('users')
        .getOne(value)
        .then((u) => setSelectedName(u.name || u.email))
        .catch(() => {})
    }
  }, [value, selectedName])

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true)
      try {
        const result = await pb.collection('users').getList(1, 10, {
          filter: search ? `name ~ "${search}" || email ~ "${search}"` : '',
          sort: 'name',
        })
        setPatients(result.items)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    const delay = setTimeout(fetchPatients, 300)
    return () => clearTimeout(delay)
  }, [search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? selectedName : 'Selecione um paciente...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar paciente..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto my-2" />
              ) : (
                'Nenhum paciente encontrado.'
              )}
            </CommandEmpty>
            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.id}
                  onSelect={() => {
                    onChange(patient.id)
                    setSelectedName(patient.name || patient.email)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === patient.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {patient.name} ({patient.email})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
