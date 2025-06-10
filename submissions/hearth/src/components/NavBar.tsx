import Button from "./utils/Button";

type NavBarProps = {
  isSettingsActive: boolean;
  setIsSettingsActive: (arg0: boolean) => void;
};

const NavBar = ({ isSettingsActive, setIsSettingsActive }: NavBarProps) => {
  return (
    <nav className="flex">
      <h1 className="w-11/12 text-center text-lg font-bold">Hearth</h1>
      <Button
        onClick={() => setIsSettingsActive(!isSettingsActive)}
        children="⚙"
        className="w-1/12 rounded-lg bg-primary text-lg hover:bg-secondary"
      />
    </nav>
  );
};

export default NavBar;
