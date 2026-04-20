import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function InvalidTokenCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Invalid invitation</CardTitle>
        <CardDescription>
          This invitation link is missing or malformed. Please check the link and try again.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}