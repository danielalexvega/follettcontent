import { FC, PropsWithChildren } from "react";
import Container from "./Container";

type PageSectionProps = PropsWithChildren<
  Readonly<{
    color: string;
    className?: string;
  }>
>;

const PageSection: FC<PageSectionProps> = ({ children, color, className }) => (
  <div className={color} >
    <Container className={className}>
      {children}
    </Container>
  </div>
);

export default PageSection;
