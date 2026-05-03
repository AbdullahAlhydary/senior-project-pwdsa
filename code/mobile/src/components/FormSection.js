// Renders a single form section (Injection / Formation / Chemistry).
//
// All fields and section metadata come from `domain/fields.js`, so adding
// or reordering an input is a one-line change there — no JSX edits here.

import Card from "./Card";
import FormField from "./FormField";
import SegmentedSelect from "./SegmentedSelect";
import { useI18n } from "../i18n";
import { LITHOLOGY_OPTIONS } from "../domain/fields";

export default function FormSection({
  section,
  values,
  onChangeValue,
  errors,
  lithology,
  onChangeLithology,
}) {
  const { t } = useI18n();
  return (
    <Card title={t[section.titleKey]} tooltip={t[section.tipKey]}>
      {section.fields.map((f) => {
        // Lithology — render a SegmentedSelect instead of a TextInput.
        if (f.type === "select") {
          return (
            <SegmentedSelect
              key={f.key}
              label={t[f.labelKey]}
              tooltip={t[f.tipKey]}
              value={lithology}
              onChange={onChangeLithology}
              error={errors[f.key]}
              options={LITHOLOGY_OPTIONS.map((o) => ({
                value: o.value,
                label: t[o.labelKey],
              }))}
            />
          );
        }
        return (
          <FormField
            key={f.key}
            label={t[f.labelKey]}
            tooltip={t[f.tipKey]}
            value={values[f.key]}
            onChangeText={onChangeValue(f.key)}
            error={errors[f.key]}
          />
        );
      })}
    </Card>
  );
}
