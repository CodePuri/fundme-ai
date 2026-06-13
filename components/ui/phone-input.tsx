import React, { forwardRef } from "react";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Input } from "./input";
import { Field, FieldLabel } from "./field";

export type PhoneData = {
  phone_country_name: string | null;
  phone_country_code: string | null;
  phone_country_iso2: string | null;
  phone_number_raw: string | null;
  phone_number_e164: string | null;
};

interface PhoneFieldProps {
  value: string;
  onChange: (value: string, data: PhoneData) => void;
  error?: string | null;
}

const CustomInput = forwardRef<HTMLInputElement, any>(({ error, className, ...props }, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      className={`h-10 sm:h-12 rounded-[10px] sm:rounded-[12px] bg-black/[0.02] border transition-all text-[14px] sm:text-[16px] px-3 sm:px-4 ${
        className || ""
      } ${error ? "border-[#ff6b3d] bg-[#fff5f0]" : "border-black/5 focus:bg-white"}`}
    />
  );
});
CustomInput.displayName = "CustomInput";

export function getCountryName(countryCode: string | null) {
  if (!countryCode) return null;
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(countryCode) || null;
  } catch {
    return null;
  }
}

export function PhoneInputField({ value, onChange, error }: PhoneFieldProps) {
  const handleChange = (val?: string) => {
    if (!val) {
      onChange("", {
        phone_country_name: null,
        phone_country_code: null,
        phone_country_iso2: null,
        phone_number_raw: null,
        phone_number_e164: null,
      });
      return;
    }

    const parsed = parsePhoneNumber(val);
    if (parsed) {
      const iso2 = parsed.country || null;
      onChange(val, {
        phone_country_name: getCountryName(iso2),
        phone_country_code: `+${parsed.countryCallingCode}`,
        phone_country_iso2: iso2,
        phone_number_raw: parsed.nationalNumber,
        phone_number_e164: parsed.number,
      });
    } else {
      onChange(val, {
        phone_country_name: null,
        phone_country_code: null,
        phone_country_iso2: null,
        phone_number_raw: val,
        phone_number_e164: val,
      });
    }
  };

  return (
    <Field className="gap-1 sm:gap-2.5 md:col-span-2">
      <FieldLabel className="text-[11px] sm:text-[13px] font-bold text-black uppercase tracking-wider mb-0.5 sm:mb-2.5">
        Mobile number <span className="text-[#ff6b3d]">*</span>
      </FieldLabel>
      <style dangerouslySetInnerHTML={{__html: `
        .PhoneInput { display: flex; align-items: center; }
        .PhoneInputCountry { position: relative; align-self: stretch; display: flex; align-items: center; margin-right: 0.5rem; }
        .PhoneInputCountrySelect { position: absolute; top: 0; left: 0; height: 100%; width: 100%; z-index: 1; border: 0; opacity: 0; cursor: pointer; }
        .PhoneInputCountryIcon { width: 1.5em; height: 1.1em; }
        .PhoneInputCountryIcon--square { width: 1.1em; }
        .PhoneInputCountryIcon--border { box-shadow: 0 0 0 1px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.1); }
        .PhoneInputCountryIconImg { display: block; width: 100%; height: 100%; object-fit: cover; }
        .PhoneInputInput { flex: 1; min-width: 0; }
        .has-error input { border-color: #ff6b3d !important; background-color: #fff5f0 !important; }
      `}} />
      <div className="relative phone-wrapper w-full">
        <PhoneInput
          international
          defaultCountry="IN"
          value={value}
          onChange={handleChange}
          inputComponent={CustomInput}
          error={error}
          className={`w-full ${error ? "has-error" : ""}`}
        />
      </div>
      {error && (
        <div className="text-[11px] text-[#ff6b3d] mt-0.5 font-medium">{error}</div>
      )}
    </Field>
  );
}
