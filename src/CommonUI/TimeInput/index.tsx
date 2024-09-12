import React, {useState} from 'react';
import {Input, Space} from 'antd';
import timeString from 'timestring';

import PrimaryButton from '../PrimaryButton';

const TimeInput = () => {
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [timeStringValue, setTimeStringValue] = useState<string>();

  const addTime = (time: string, reset: boolean = false) => {
    if (time === '' && reset) {
      setDurationSeconds(0);
      return;
    }
    const parseTime = timeString(time) + (reset ? 0 : durationSeconds);
    setDurationSeconds(parseTime);
    if (!reset) {
      setTimeStringValue(timeToString(parseTime));
    }
  };

  const timeToString = (seconds: number) => {
    let date = new Date(seconds * 1000);
    let hh = date.getUTCHours();
    let mm = date.getUTCMinutes();
    return (hh > 0 ? hh + 'h ' : '') + (mm > 0 ? mm + 'm' : '');
  };

  return (
    <>
      <Input
        value={timeStringValue}
        allowClear
        onChange={event => {
          setTimeStringValue(event.target.value);
          addTime(event.target.value, true);
        }}
        addonAfter={
          <Space>
            <PrimaryButton onClick={() => addTime('10m')} label={'+10m'} size={'small'} ghost />
            <PrimaryButton onClick={() => addTime('1h')} label={'+1h'} size={'small'} ghost />
          </Space>
        }
      />
      {durationSeconds}
    </>
  );
};

export default TimeInput;
