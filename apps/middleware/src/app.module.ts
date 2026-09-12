import { Module } from '@nestjs/common';
import { SlotsModule } from './slots/slots.module';
import { HoldsModule } from './holds/holds.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { LineModule } from './line/line.module';

@Module({
  imports: [LineModule, SlotsModule, HoldsModule, BookingsModule, PaymentsModule],
})
export class AppModule {}
