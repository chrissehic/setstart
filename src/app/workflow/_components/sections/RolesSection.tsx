import React from 'react'
import RolesList from '../RolesList'
import { MainNodeData } from '@/types/workflow-components'
import { sectionClass } from '../Workspace'

function RolesSection({ data }: { data: MainNodeData }) {
  return (
 <div className={sectionClass}>
      <div className="flex flex-col justify-start gap-2 w-full">
        <div className="flex flex-row justify-start items-center flex-wrap gap-2 w-full">
          <RolesList data={data} />
        </div>
      </div>
    </div>  )
}

export default RolesSection