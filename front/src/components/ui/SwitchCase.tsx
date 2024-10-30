interface SwitchCaseProps {
  value: string;
  cases: { [key: string]: React.ReactNode };
  defaultComponent?: React.ReactNode;
}

const SwitchCase: React.FC<SwitchCaseProps> = ({ value, cases, defaultComponent }) => {
  const MatchedComponent = cases[value] || defaultComponent;
  return MatchedComponent ? <>{MatchedComponent}</> : null;
};

export default SwitchCase;
