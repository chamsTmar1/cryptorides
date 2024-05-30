import * as React from 'react';
import { CarFilters } from '../models/car-filters.model';
import { Card, Container, FormControl, FormLabel, IconButton, Stack, TextField } from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { DateRange, DateRangePicker, LocalizationProvider } from '@mui/x-date-pickers-pro';
import { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Label } from '@mui/icons-material';

export default function CenterCarFiltersComponent(props: {filters: CarFilters, setFilters: React.Dispatch<React.SetStateAction<CarFilters>>}) {
  

  const handleDateRangeChange = (newValue: DateRange<Dayjs>) => {
    const newFilters = {...props.filters};
    newFilters.availabilityFrom = newValue[0]?.toDate() ??  null;
    newFilters.availabilityTo = newValue[1]?.toDate() ??  null;
    props.setFilters(newFilters);
  }

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 1, marginY: 2 }}>
      

        <Stack direction={"row"} marginTop={2}>
          <FormControl margin   ="dense">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateRangePicker 
                name="availabilityPeriod"
                localeText={{ start: 'Availabilty From', end: 'Availabilty TO' }}
                onChange={handleDateRangeChange}
                />
              </LocalizationProvider>
          </FormControl>
        
      </Stack>
    </Card>
  );
}