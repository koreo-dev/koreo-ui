export type Item = {
  id: string;
  label: string;
  type: string;
  children?: Item[];
  disabled?: boolean;
};
