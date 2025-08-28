import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Check } from 'lucide-react';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react'
import { PRODUCT_TYPES } from '@/lib/constants';

export default function ProductType({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) {
    const [open, setOpen] = React.useState(false);
  
    return (
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? PRODUCT_TYPES.find((type) => type.value === value)?.label
              : "Select product type..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search type..." className="h-9" />
            <CommandList>
              <CommandEmpty>No offering type found.</CommandEmpty>
              <CommandGroup>
                {PRODUCT_TYPES.map((type) => (
                  <CommandItem
                    key={type.value}
                    value={type.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue);
                      setOpen(false);
                    }}
                  >
                    {type.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === type.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }