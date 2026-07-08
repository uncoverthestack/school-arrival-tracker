import { Fragment } from 'react'

// name + a row of label/value fields (CLASS / STUDENT ID / ARRIVED, or
// CLASS / STUDENT ID / ENTERED CODE on the confirm screen).
export function StudentDetails({ name, fields }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-headline-medium font-bold text-on-surface">{name}</p>
      <div className="flex items-center gap-[22px]">
        {fields.map((field, i) => (
          <Fragment key={field.label}>
            {i > 0 && <span className="w-px h-[30px] bg-outline-variant" />}
            <div className="flex flex-col items-center gap-[3px]">
              <p className="text-label-small font-medium tracking-[0.5px] text-on-surface-variant">{field.label}</p>
              <p className={`text-label-large font-medium tracking-[0.1px] ${field.accent ? 'text-primary' : 'text-on-surface'}`}>
                {field.value}
              </p>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
