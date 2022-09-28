class Model {
  constructor() {
    this.observers = [];
  }

  addChangeListener(observer) {
    this.observers.push(observer);
    return this;
  }

  removeChangeListener(observer) {
    this.observers = this.observers.filter((l) => l !== observer);
    return this;
  }

  raiseChange() {
    this.observers.forEach((observer) => observer());
    return this;
  }
}

export class ContactList extends Model {
  get(id) {
    return this.asyncRequest(`/api/contacts/${id}`);
  }

  getAll() {
    return this.asyncRequest("/api/contacts");
  }

  add(contact) {
    contact.tags = contact.tags.toLowerCase();

    this.asyncRequest("/api/contacts", {
      method: "post",
      headers: { "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify(contact),
    }).then(() => {
      this.raiseChange();
      alert("New Contact created.");
    });
  }

  update(id, contact) {
    this.asyncRequest(`/api/contacts/${id}`, {
      method: "put",
      headers: { "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify(contact),
    }).then(() => {
      this.raiseChange();
      alert("Contact updated");
    });
  }

  delete(id) {
    this.asyncRequest(`/api/contacts/${id}`, { method: "delete" }).then(() => {
      this.raiseChange();
      alert("Contact Deleted");
    });
  }

  asyncRequest(url, options) {
    return fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }

        if (response.status !== 204) {
          return response.json();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
