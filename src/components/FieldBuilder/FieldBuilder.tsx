import FieldList from './FieldList';
import FieldProperties from './FieldProperties';
import './FieldBuilder.css';

export default function FieldBuilder() {
  return (
    <div className="field-builder">
      <FieldList />
      <FieldProperties />
    </div>
  );
}
