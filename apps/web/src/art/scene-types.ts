export interface SceneProps {
  a: string | undefined;
  b?: string | undefined;
  y: string | undefined;
}

export const isOn = (value: string | undefined): boolean => value === '1';
