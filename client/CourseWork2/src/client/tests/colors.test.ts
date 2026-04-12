import '@testing-library/jest-dom';
import { getStatusColor } from '../utils/colors';

it('Проверка цветов', () => {
  const status = 'TODO';
  const expected = 'blue';

  const result = getStatusColor(status)

  expect(result).toBe(expected)
});
