import SetIcon from '@/components/SetIcon'
import React from 'react'

function loading() {
  return (
    <div className='flex flex-1 flex-col h-screen w-full items-center justify-center'>
          <SetIcon className="size-8 text-primary" loading={true} animated={false}/>
    </div>
  )
}

export default loading