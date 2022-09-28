import { htmlToDOM } from './helpers.js';

class View {
  constructor() {
    this.observers = [];
  }

  addEventObserver(observer) {
    this.observers.push(observer);
    return this;
  }

  removeEventObserver(observer) {
    this.observers = this.observers.filter((o) => o !== observer);
    return this;
  }

  delegateEvent(eventType, data) {
    this.observers.forEach((observer) => {
      observer.dispatchEvent(new CustomEvent(eventType, { detail: data }));
    });
  }

  render() {
    return undefined;
  }
}

export class ContactListView extends View {
  constructor(contactList) {
    super();
    this.contactList = contactList;
    this.contactListTemplate = Handlebars.templates["contact_list"];
    this.searchPartialTemplate = Handlebars.templates["search_partial"];
    this.query = "";
    this.selectedTag = "";
    this.contacts = undefined;
    this.contactListDOM = undefined;
  }

  render() {
    return this.contactList.getAll().then((contacts) => {
      this.contacts = contacts;
      this.contactListDOM = htmlToDOM(
        this.contactListTemplate({
          contacts: this.contacts,
          query: this.query,
          selectedTag: this.selectedTag,
        })
      );
      this.bind();
      return this.contactListDOM;
    });
  }

  renderPartial() {
    this.contactListDOM.querySelector(".partial-content").innerHTML =
      this.searchPartialTemplate({
        contacts: this.contacts,
        query: this.query,
        selectedTag: this.selectedTag,
      });
    this.bindPartial();
  }

  bind() {
    const addContactButtons = this.contactListDOM.querySelectorAll(
      "[data-type='add-contact']"
    );
    const searchBar = this.contactListDOM.querySelector(".primary-input");
    const tagFilter = this.contactListDOM.querySelector(".tag-filter");

    this.bindPartial();

    addContactButtons.forEach((button) => {
      button.addEventListener(
        "click",
        this.handleAddContactButtonClick.bind(this)
      );
    });

    searchBar.addEventListener("input", this.handleSearchInput.bind(this));

    tagFilter?.addEventListener("change", this.handleTagFilter.bind(this));
  }

  bindPartial() {
    const contactList = this.contactListDOM.querySelector(".contacts");

    contactList?.addEventListener(
      "click",
      this.handleContactCardClick.bind(this)
    );
  }

  handleAddContactButtonClick(event) {
    this.delegateEvent("showAddContactForm", event);
  }

  handleContactCardClick(event) {
    let target = event.target;

    const CONTACT_CARD_ACTIONS = {
      edit() {
        this.delegateEvent("showEditContactForm", event);
      },
      delete() {
        this.delegateEvent("deleteContact", event);
      },
    };

    if (target.tagName === "BUTTON") {
      CONTACT_CARD_ACTIONS[target.dataset.type].call(this);
    }
  }

  handleSearchInput(event) {
    this.delegateEvent("searchQuery", event);
  }

  handleTagFilter(event) {
    this.delegateEvent("tagFilter", event);
  }
}

export class AddContactFormView extends View {
  constructor() {
    super();
    this.addContactFormTemplate = Handlebars.templates["add_contact_form"];
    this.addContactFormDOM = htmlToDOM(this.addContactFormTemplate());

    this.bind();
  }

  render() {
    return this.addContactFormDOM;
  }

  bind() {
    const addContactForm =
      this.addContactFormDOM.querySelector(".add-contact-form");
    addContactForm.addEventListener(
      "submit",
      this.handleFormSubmission.bind(this)
    );
    addContactForm.addEventListener(
      "reset",
      this.handleFormCancellation.bind(this)
    );
  }

  handleFormSubmission(event) {
    this.delegateEvent("submitAddContactForm", event);
  }

  handleFormCancellation(event) {
    this.delegateEvent("cancelForm", event);
  }
}

export class EditContactFormView extends View {
  constructor() {
    super();
    this.editContactFormTemplate = Handlebars.templates["edit_contact_form"];
    this.editContactFormDOM = undefined;
    this.contact = undefined;
  }

  bind() {
    const editContactForm =
      this.editContactFormDOM.querySelector(".edit-contact-form");

    editContactForm.addEventListener(
      "submit",
      this.handleFormSubmission.bind(this)
    );

    editContactForm.addEventListener(
      "reset",
      this.handleFormCancellation.bind(this)
    );
  }

  render() {
    this.editContactFormDOM = htmlToDOM(
      this.editContactFormTemplate(this.contact)
    );

    this.bind();
    return this.editContactFormDOM;
  }

  handleFormSubmission(event) {
    this.delegateEvent("submitEditContactForm", event);
  }

  handleFormCancellation(event) {
    this.delegateEvent("cancelForm", event);
  }
}