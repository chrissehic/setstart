import { Loader2 } from 'lucide-react'
import React from 'react'

function loading() {
  return (
    <div className='flex flex-1 flex-col h-screen w-full items-center justify-center'>
          <Loader2 className="size-8 animate-spin text-transparent stroke-1 stroke-foreground" />
    </div>
  )
}

export default loading