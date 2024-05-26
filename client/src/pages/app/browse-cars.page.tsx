import React, { useEffect, useState } from 'react';
import CarGrid from '../../components/car-grid.component';
import { CarFilters } from '../../models/car-filters.model';
import CarFiltersComponent from '../../components/car-filters.component';
import { Grid } from '@mui/material';
import axios from 'axios';
import { getUserToken } from '../../helpers/auth.helpers';
import CenterCarFiltersComponent from '../../components/center-car-filters.component';
import SendRentalRequestButton from '../../components/SendRentalRequestButton';

const useDebouncedFilters = (filters: CarFilters, delay: number) => {
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [filters, delay]);

  return debouncedFilters;
};


function BrowseCarsPage() {
  const initialFilters: CarFilters = {
    availabilityFrom: null,
    availabilityTo: null,
    minPrice: null,
    maxPrice: null,
    minDownPayment: null,
    maxDownPayment: null,
    search: null,
    location: null,
    color: null,
    brand: null
  }
  const [filters, setFilters] = useState(initialFilters);
  const [cars, setCars] = useState([])

  // improves UX and perf as we don't fetch on each filter change
  // source: https://www.dhiwise.com/post/ultimate-guide-to-implementing-react-debounce-effectively
  const debouncedFilters = useDebouncedFilters(filters, 500);

  const getCarsWithFilters = async () => {
    const query = `
      query filteredCars ($filter: CarFilter)
      {
        filteredCars(filter: $filter) {
          id,
          location,
          brand,
          color,
          title,
          fuelType,
          seatsNumber,
          rentalPrice,
          downPayment,
          images {url}
        }
      }
    `;

    try {
      const response = await axios.post(
        "http://localhost:3001/graphql",
        {
          query,
          variables: { filter: filters },
        },
        {
          headers: {
            Authorization: `Bearer ${getUserToken()}`,
          },
        }
      );

      setCars(response.data.data.filteredCars);
    }
    catch {
      console.log("error")
    }
  }

  useEffect(() => {
    getCarsWithFilters();
  }, [debouncedFilters]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={2.5}>
        <CarFiltersComponent filters={filters} setFilters={setFilters} />
      </Grid>
      <Grid item xs={8}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
        >
          <Grid item width={"70%"}>
            <CenterCarFiltersComponent filters={filters} setFilters={setFilters} />
          </Grid>
        </Grid>
        <CarGrid cars={cars}></CarGrid>
      </Grid>
    </Grid>

  );
}

export default BrowseCarsPage;
