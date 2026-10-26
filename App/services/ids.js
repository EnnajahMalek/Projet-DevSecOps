function toNoteId(id) {
  const value = Number.parseInt(id, 10);
  return Number.isInteger(value) && value > 0 ? value : null;
}

module.exports = { toNoteId };
