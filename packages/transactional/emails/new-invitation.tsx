import {
 Button,
 Heading,
 Text,
 Section,
 Row,
 Column,
 pretty,
 render,
} from "react-email";
import Layout from "../layout";
import React from "react";

export type InvitationEmailProps = {
 inviterName: string;
 documentTitle: string;
 inviteUrl: string;
}

export async function invitationEmailHtml(props: InvitationEmailProps): Promise<string> {
  return pretty(await render(React.createElement(InvitationEmail, props)));
}

export default function InvitationEmail({
 inviterName,
 documentTitle,
 inviteUrl,
}: InvitationEmailProps) {

 return (
  <Layout>
   <Section
    style={{
     width: "100%",
    }}
   >
    <Row
    >
     <Column
      align="center"
      style={{
       verticalAlign: "middle",
      }}
     >

      {/* LEFT section */}
      <div style={{ textAlign: "left" }}>
       <Heading as="h1">
        You've been invited to collaborate on a document
       </Heading>

       <Text className="text-base">
        Hello! {inviterName} has invited you to collaborate on the
        document "{documentTitle}".
       </Text>

       <Text className="text-base">
        Click the button below to accept the invitation and start
        collaborating in real time with {inviterName} and others.
       </Text>
      </div>

      <div className="text-center">
       <Button
        href={inviteUrl}
        className="px-6 py-3 text-white bg-black rounded-full inline-block hover:scale-105 transition-all text-base"
       >
        Accept invitation
       </Button>
      </div>


      <Text className="text-left text-base">
       If the button doesn’t work or for some weird reason doesnt render properly, copy and paste this link into your
       browser: <span className="text-blue-600">{inviteUrl}</span>
      </Text>

      <Text className="text-left text-base text-gray-600">
       If you did not expect this invitation, you can safely ignore this
       email.
      </Text>
     </Column>
    </Row>
   </Section>
  </Layout>
 );
}