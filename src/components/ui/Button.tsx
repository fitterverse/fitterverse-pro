import React from 'react'
import clsx from 'classnames'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  full?: boolean
}

export default function Button({ variant='primary', full=false, className, ...rest }: Props){
  return (
    <button
      className={clsx('btn', {
        'btn-primary': variant==='primary',
        'btn-secondary': variant==='secondary',
        'hover:bg-slate-800': variant==='ghost',
        'w-full': full
      }, className)}
      {...rest}
    />
  )
}
