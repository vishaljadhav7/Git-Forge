'use client'

import React from 'react'

const Project = ({ params }: { params: Promise<{ projectId : string }> }) => {

const resolvedParams = React.use(params);
  const { projectId } = resolvedParams;

  return (
    <div>Project : {projectId}</div>
  )
}

export default Project;