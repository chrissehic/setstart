import React, { ReactNode } from 'react'

function layout({children}: {children: ReactNode}) {
  return (
    <div className='flex flex-col h-screen justify-center items-center w-full bg-background'>{children}</div>
  )
}

export default layout