import { useState } from 'preact/hooks';

function TabSelector() {
  const [selectedOption, setSelectedOption] = useState('');

  const handleChange = (e) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div>

    </div>
  );
}

export default TabSelector;
