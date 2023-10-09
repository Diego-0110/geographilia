import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@lib/utils'

const badgeVariants = cva(
  'text-base px-2 py-0 rounded',
  {
    variants: {
      variant: {
        default:
          'bg-blue-500 text-white dark:bg-blue-900 dark:text-blue-300',
        dark:
          'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        red:
          'bg-red-600 text-white dark:bg-red-900 dark:text-red-300',
        green:
          'bg-green-600 text-white dark:bg-green-900 dark:text-green-300'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export default function Badge ({ className, variant, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}
