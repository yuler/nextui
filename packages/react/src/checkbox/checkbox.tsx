import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  useImperativeHandle,
  PropsWithoutRef,
  RefAttributes
} from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useCheckbox } from './checkbox-context';
import CheckboxGroup from './checkbox-group';
import useWarning from '../use-warning';
import { NormalSizes, NormalColors, SimpleColors } from '../utils/prop-types';
import { CSS } from '../theme/stitches.config';
import {
  StyledCheckboxLabel,
  StyledCheckboxContainer,
  StyledCheckboxInput,
  StyledCheckboxMask,
  StyledIconCheck,
  CheckboxVariantsProps,
  StyledIconCheckFirstLine,
  StyledIconCheckSecondLine,
  CheckboxContainerVariantsProps,
  StyledCheckboxText
} from './checkbox.styles';
import clsx from '../utils/clsx';
import { __DEV__ } from '../utils/assertion';

interface CheckboxEventTarget {
  checked: boolean;
}

export interface CheckboxEvent {
  target: CheckboxEventTarget;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: React.ChangeEvent;
}

export interface Props {
  value?: string;
  color?: NormalColors;
  size?: NormalSizes;
  label?: string;
  labelColor?: SimpleColors;
  line?: boolean;
  indeterminate?: boolean;
  animated?: boolean;
  rounded?: boolean;
  checked?: boolean;
  disabled?: boolean;
  initialChecked?: boolean;
  preventDefault?: boolean;
  onChange?: (e: CheckboxEvent) => void;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const defaultProps = {
  value: '',
  size: 'md' as NormalSizes,
  color: 'default' as NormalColors,
  labelColor: 'default' as SimpleColors,
  disabled: false,
  preventDefault: true,
  initialChecked: false,
  indeterminate: false,
  rounded: false,
  line: false,
  animated: true,
  className: ''
};

type NativeAttrs = Omit<React.InputHTMLAttributes<unknown>, keyof Props>;
export type CheckboxProps = Props &
  typeof defaultProps &
  CheckboxVariantsProps &
  NativeAttrs & { css?: CSS };

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      initialChecked,
      line,
      rounded,
      indeterminate,
      disabled,
      onChange,
      size,
      className,
      children,
      label,
      color,
      labelColor,
      animated,
      value,
      preventDefault,
      ...props
    },
    ref: React.Ref<HTMLInputElement | null>
  ) => {
    const [selfChecked, setSelfChecked] = useState<boolean>(initialChecked);
    const [selfIndeterminate, setSelfIndeterminate] =
      useState<boolean>(indeterminate);

    const checkboxRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => checkboxRef?.current);

    const {
      color: groupColor,
      labelColor: labelGroupColor,
      size: groupSize,
      updateState,
      inGroup,
      disabledAll,
      values
    } = useCheckbox();

    const {
      isFocusVisible,
      focusProps
    }: {
      isFocusVisible: boolean;
      focusProps: Omit<
        React.HTMLAttributes<HTMLElement>,
        keyof CheckboxContainerVariantsProps | keyof CheckboxProps
      >;
    } = useFocusRing();

    const isDisabled = inGroup ? disabledAll || disabled : disabled;

    const checkboxColor = color !== 'default' ? color : groupColor;
    const checkboxSize = size !== 'md' ? size : groupSize;
    const textColor = labelColor !== 'default' ? labelColor : labelGroupColor;

    if (__DEV__ && inGroup && checked) {
      useWarning(
        'Remove props "checked" when [Checkbox] component is in the group.',
        'Checkbox'
      );
    }
    if (inGroup) {
      useEffect(() => {
        const next = values.includes(value);
        if (next === selfChecked) return;
        setSelfChecked(next);
      }, [values.join(',')]);
    }

    useEffect(() => {
      setSelfIndeterminate(indeterminate);
    }, [indeterminate]);

    const changeHandle = useCallback(
      (ev: React.ChangeEvent) => {
        if (isDisabled) return;
        const selfEvent: CheckboxEvent = {
          target: {
            checked: !selfChecked
          },
          stopPropagation: ev.stopPropagation,
          preventDefault: ev.preventDefault,
          nativeEvent: ev
        };
        if (inGroup && updateState) {
          updateState && updateState(value, !selfChecked);
        }

        if (selfIndeterminate) {
          setSelfIndeterminate(false);
          setSelfChecked(true);
        } else {
          setSelfChecked(!selfChecked);
        }

        onChange && onChange(selfEvent);
      },
      [updateState, onChange, isDisabled, selfChecked, selfIndeterminate]
    );
    useEffect(() => {
      if (checked === undefined) return;
      setSelfChecked(checked);
    }, [checked]);

    const getState = useMemo(() => {
      return selfChecked && selfIndeterminate
        ? 'mixed'
        : selfChecked
        ? 'checked'
        : 'uncheked';
    }, [selfChecked, selfIndeterminate]);

    return (
      <StyledCheckboxLabel
        size={checkboxSize}
        disabled={isDisabled}
        animated={animated}
        className={clsx(
          'nextui-checkbox-label',
          `nextui-checkbox--${getState}`,
          className
        )}
        css={props.css}
      >
        <StyledCheckboxContainer
          className="nextui-checkbox-container"
          tabIndex={isDisabled ? -1 : 0}
          color={checkboxColor}
          rounded={rounded}
          disabled={isDisabled}
          animated={animated}
          isFocusVisible={isFocusVisible}
          {...focusProps}
        >
          <StyledCheckboxInput
            ref={checkboxRef}
            type="checkbox"
            className="nextui-checkbox-input"
            tabIndex={-1}
            data-state={getState}
            disabled={isDisabled}
            checked={selfChecked}
            aria-checked={
              selfChecked && selfIndeterminate ? 'mixed' : selfChecked
            }
            aria-disabled={isDisabled}
            onChange={changeHandle}
            {...props}
          />
          <StyledCheckboxMask
            checked={selfChecked}
            animated={animated}
            className="nextui-checkbox-mask"
          >
            <StyledIconCheck
              size={checkboxSize}
              indeterminate={selfIndeterminate}
              checked={selfChecked}
              animated={animated}
              className="nextui-icon-check"
            >
              <StyledIconCheckFirstLine
                indeterminate={selfIndeterminate}
                checked={selfChecked}
                animated={animated}
                className="nextui-icon-check-line1"
              />
              <StyledIconCheckSecondLine
                indeterminate={selfIndeterminate}
                checked={selfChecked}
                animated={animated}
                className="nextui-icon-check-line2"
              />
            </StyledIconCheck>
          </StyledCheckboxMask>
        </StyledCheckboxContainer>
        {(children || label) && (
          <StyledCheckboxText
            className="nextui-checkbox-text"
            color={textColor}
            line={line}
            checked={selfChecked}
            disabled={isDisabled}
            animated={animated}
          >
            {children || label}
          </StyledCheckboxText>
        )}
      </StyledCheckboxLabel>
    );
  }
);

Checkbox.defaultProps = defaultProps;

Checkbox.toString = () => '.nextui-checkbox';

if (__DEV__) {
  Checkbox.displayName = 'NextUI - Checkbox';
}

type CheckboxComponent<T, P = {}> = React.ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<T>
> & {
  Group: typeof CheckboxGroup;
};

type ComponentProps = Partial<typeof defaultProps> &
  Omit<Props, keyof typeof defaultProps> &
  NativeAttrs &
  CheckboxVariantsProps & { css?: CSS };

export default Checkbox as CheckboxComponent<HTMLInputElement, ComponentProps>;
