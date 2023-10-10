export default function CheckBoxLabeled ({ id, children, value, register, name }) {
  return (
    <div className="flex gap-1">
      <input id={id} type="checkbox" value={value} {...register(name, { required: true })}/>
      <label htmlFor={id}>{children}</label>
    </div>
  )
}
