import { IdCard } from './IdCard'
import { StudentDetails } from './StudentDetails'

export function ConfirmView({ student, code, codePrefix, onConfirm, onCancel }) {
  const displayCode = codePrefix ? `${codePrefix}-${code}` : code

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-1">
        <p className="text-headline-small text-on-surface">Is this the right student?</p>
        <p className="text-body-large tracking-[0.5px] text-on-surface-variant">Code {displayCode} matched one student</p>
      </div>

      <IdCard variant="photo" photoUrl={student.photoUrl} studentName={student.name} />

      <StudentDetails
        name={student.name}
        fields={[
          { label: 'CLASS', value: student.studentClass ?? '—' },
          { label: 'STUDENT ID', value: student.studentId ?? '—' },
          { label: 'ENTERED CODE', value: displayCode }
        ]}
      />

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="h-11 px-5 rounded-sm bg-primary text-on-primary font-medium text-label-large tracking-[0.1px]"
        >
          Check in {student.name?.split(' ')[0]}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-label-large font-medium tracking-[0.1px] text-primary bg-transparent border-none cursor-pointer p-0"
        >
          Not them — re-enter code
        </button>
      </div>
    </div>
  )
}
