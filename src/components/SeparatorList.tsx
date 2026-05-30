import { Separator } from "@/components/ui/separator"

export function SeparatorList() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2 text-sm text-silver list-section-silver">
      <dl className="flex items-center justify-between">
        <dt>Item 1</dt>
        <dd className="text-silver">Value 1</dd>
      </dl>
      <Separator />
      <dl className="flex items-center justify-between">
        <dt>Item 2</dt>
        <dd className="text-silver">Value 2</dd>
      </dl>
      <Separator />
      <dl className="flex items-center justify-between">
        <dt>Item 3</dt>
        <dd className="text-silver">Value 3</dd>
      </dl>
    </div>
  )
}
