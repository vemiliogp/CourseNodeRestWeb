export class UpdateTodoDto {
  private constructor(
    public readonly id: number,
    public readonly text?: string,
    public readonly completedAt?: Date
  ) {}

  get values() {
    const returnObj: { [key: string]: any } = {};

    if (this.text) returnObj.text = this.text;
    if (this.completedAt) returnObj.completedAt = this.completedAt;

    return returnObj;
  }

  static create(props: { [key: string]: any }): [string?, UpdateTodoDto?] {
    const { id, text, completedAt } = props;

    if (!id || isNaN(id)) return ["Id must be a valid number", undefined];

    let newCompletedAt = completedAt;
    if (newCompletedAt) {
      newCompletedAt = new Date(completedAt);
      if (newCompletedAt.toString() === "Invalid Date")
        return ["Completed at must be a valid date", undefined];
    }

    return [undefined, new UpdateTodoDto(id, text, newCompletedAt)];
  }
}
