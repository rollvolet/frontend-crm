import { tracked } from '@glimmer/tracking';

export class ExclusivePropertyBlock {
  @tracked property;
  @tracked left = [];
  @tracked right = [];

  constructor(property, leftRecord, rightRecord, resolveFn) {
    this.property = property;
    this.initLeftAndRight(leftRecord, rightRecord);
    this.resolve = resolveFn || (() => [[this.property, this.resolvedValues[0]]]);
  }

  async initLeftAndRight(leftRecord, rightRecord) {
    const [leftValue, rightValue] = await Promise.all([
      leftRecord[this.property],
      rightRecord[this.property],
    ]);
    this.left = [new Unit(leftRecord, leftValue, 'accept')];
    this.right = [new Unit(rightRecord, rightValue, 'reject')];
  }

  get acceptedUnit() {
    return this.left[0]?.isAccepted ? this.left[0] : this.right[0];
  }

  get rejectedUnit() {
    return this.left[0]?.isRejected ? this.left[0] : this.right[0];
  }

  get resolvedValues() {
    return [this.acceptedUnit?.value];
  }

  toggleStatus() {
    this.left[0].toggleStatus();
    this.right[0].toggleStatus();
  }
}

export class MergeablePropertyBlock {
  @tracked property;
  @tracked left = [];
  @tracked right = [];

  constructor(property, leftRecord, rightRecord, resolveFn) {
    this.property = property;
    this.initLeftAndRight(leftRecord, rightRecord);
    this.resolve = resolveFn || (() => [[this.property, this.resolvedValues]]);
  }

  async initLeftAndRight(leftRecord, rightRecord) {
    [this.left, this.right] = await Promise.all([
      this.initUnits(leftRecord, 'accept'),
      this.initUnits(rightRecord, 'reject'),
    ]);
  }

  async initUnits(record, status) {
    let value = await record[this.property];
    if (record.relationshipFor(this.property)?.meta.kind == 'hasMany') {
      value = value.toArray();
    }

    if (Array.isArray(value)) {
      return value.map((v) => {
        return new Unit(record, v, status);
      });
    } else {
      return [new Unit(record, value, status)];
    }
  }

  get resolvedValues() {
    return [...this.left, ...this.right]
      .filter((unit) => unit.isAccepted)
      .map((unit) => unit.value)
      .filter((value) => value);
  }

  get rejectedValues() {
    return [...this.left, ...this.right]
      .filter((unit) => unit.isRejected)
      .map((unit) => unit.value)
      .filter((value) => value);
  }

  toggleStatus(unit) {
    unit.toggleStatus();
  }
}

class Unit {
  @tracked record;
  @tracked value;
  @tracked status; // 'accept', 'reject' or undefined

  constructor(record, value, status) {
    this.record = record;
    this.value = value;
    this.status = status;
  }

  get isAccepted() {
    return this.status == 'accept';
  }

  get isRejected() {
    return this.status == 'reject';
  }

  accept() {
    this.status = 'accept';
  }

  reject() {
    this.status = 'reject';
  }

  toggleStatus() {
    if (this.isAccepted) {
      this.reject();
    } else {
      this.accept();
    }
  }
}
