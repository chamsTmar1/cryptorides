import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Carousel from './carousel.component';
import { Button, Icon, Stack , Box } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import PeopleIcon from '@mui/icons-material/People';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Car } from '../models/car.model';
import blueCar from '../assets/images/blueRange.png';
import FlashAutoIcon from '@mui/icons-material/FlashAuto';
import SpeedIcon from '@mui/icons-material/Speed' ; 





export default function FancyCarCard(props: {car: Car}) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: '20px' }}>
        <Card sx={{ width: 300, height: 500, backgroundColor: '#1E1E1E', borderRadius: '8px', boxShadow: '0px 0px 10px 0px white', mt: '-10px', border: '1px solid #929293' }}>
            <Carousel images={props.car.images}></Carousel>
            <CardContent>
                <Typography variant="h5" sx={{ color: 'white', fontFamily: 'Montserrat', fontWeight: 'bold', textAlign: 'center', mt: '20px' }}>
                    {props.car.brand}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                    <Stack direction="row" alignItems="center">
                        <PeopleIcon sx={{ color: 'white' }} />
                        <Typography sx={{ color: 'white' }}> {props.car.seats} seats </Typography>
                    </Stack>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                    <Stack direction="row" alignItems="center">
                        <LocalGasStationIcon sx={{ color: 'white' }} />
                        <Typography sx={{ color: 'white' }}> {props.car.fuelType}</Typography>
                    </Stack>
                </Stack>
                <Typography sx={{ color: 'white', textAlign: 'center', mt: '20px' }}>{props.car.rentalPrice} DT</Typography>
              </CardContent>
        </Card>
        </Box>
)};