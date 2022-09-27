import React from 'react'

interface Props {
  label: string
  text?: string
}

export const LabelText = ({ label, text }: Props) => {
  return (
    <div>
      <p className="text-slate-400">{label}</p>
      <p className="text-slate-100 font-medium text-lg">{text || '---'}</p>
    </div>
  )
}
