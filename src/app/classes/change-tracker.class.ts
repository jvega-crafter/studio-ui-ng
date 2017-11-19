
export enum ChangeTrackerType {
  ADD_REMOVE,
  INCREASE_DECREASE,
  TYPING
}

export enum ChangeType {

  Add,
  Remove,

  Increase,
  Decrease,

  CharEntry,
  Backspace

}

// TODO: Why cli warns of this not being exported when it is an interface?
// Changed to class to get rid of warning
// https://github.com/angular/angular-cli/issues/2034
export class Change {
  type: ChangeType;
  value: any;
}

const defaultValueCompareFn = (v1, v2) => v1 === v2;

export abstract class ChangeTracker {
  action: string;
  params: any;
  constructor(public valueCompareFn = defaultValueCompareFn) {}
  protected changeStack: Array<Change> = [];
  static create(type: ChangeTrackerType, valueCompareFn = defaultValueCompareFn) {
    switch (type) {
      case ChangeTrackerType.ADD_REMOVE: {
        return new AddRemoveChangeTracker(valueCompareFn);
      }
      default: {
        console.error('Incorrect or not implemented ChangeTrackerType');
      }
    }
  }
  abstract track(change: Change): boolean;
  // abstract findAntagonists(change: Change): Change;
  protected push(change: Change) {
    this.changeStack.push(change);
  }
  protected remove(change: Change, index: number = null) {
    let stack = this.changeStack;
    if (index !== null) {
      if (stack[index] === change) {
        this.changeStack.splice(index, 1);
      } else {
        console.error('Wrong index supplied to ChangeTracker.remove function');
      }
    } else {
      this.changeStack = stack.filter((item) => change === item);
    }
  }
  latest() {
    return this.changeStack[this.changeStack.length - 1];
  }
  hasChanges() {
    return !!(this.changeStack.length);
  }
}

export class AddRemoveChangeTracker extends ChangeTracker {
  track(change: Change): boolean {
    let i = 0;
    let antagonist = null;
    let valueCompareFn = this.valueCompareFn;
    if (change.type !== ChangeType.Add && change.type !== ChangeType.Remove) {
      throw new Error('Incorrect change type for AddRemoveChangeTracker class');
    }
    for (let l = this.changeStack.length; i < l; ++i) {
      let stackItem = this.changeStack[i];
      let isEquivalent = valueCompareFn(stackItem.value, change.value);
      // If/Else logic kept separate for code readability.
      if (change.type === ChangeType.Add) {
        if ((stackItem.type === ChangeType.Remove) && isEquivalent) {
          antagonist = stackItem;
          break;
        }
      } else if (change.type === ChangeType.Remove) {
        if ((stackItem.type === ChangeType.Add) && isEquivalent) {
          antagonist = stackItem;
          break;
        }
      }
    }
    if (antagonist) {
      this.remove(antagonist, i);
    } else {
      this.push(change);
    }
    return true;
  }
}