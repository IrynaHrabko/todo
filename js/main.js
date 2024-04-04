let listArray = []
let counter = 0
const createForm = document.forms.createForm
const List = document.querySelector('.list')
let editIndex = -1;

/* modules/ListItem.js */
class ListItem {
    constructor(type, name, desc, deadline, isDone) {
        this.type = type
        this.name = name
        this.desc = desc
        this.listId = counter
        this.deadline = deadline
        this.isDone = isDone
    }

    addItem() {
        listArray.push({
            type: this.type,
            name: this.name,
            desc: this.desc,
            listId: this.listId,
            deadline: this.deadline,
            isDone: this.isDone,
        })

        this.renderItem()

        console.log(listArray)
        counter++

    }

    startEditItem(target) {
        // Знайти елемент для зміни
        let item = target.closest('.list-item')
        // Отримати дані елемента
        let itemInArray = listArray.find(
            (todo) => +todo.listId === +item.getAttribute('data-id')
        )
        // Ввести нові дані
        let date = new Date(itemInArray.deadline)

        createForm.elements.name.value = itemInArray.name
        createForm.elements.type.value = itemInArray.type
        createForm.elements.deadline.value = `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}-${formatNumber(date.getDate())}`
        createForm.elements.desc.value = itemInArray.desc

        editIndex = itemInArray.listId
        createForm.elements.button.innerText = 'Редагувати'
        createForm.scrollIntoView({
            alignToTop: true,
            behavior: 'smooth'
        })
    }

    removeItem(target) {
        let item = target.closest('.list-item')
        item.remove()
        let itemIndex = listArray.findIndex(
            (todo) => +todo.listId === +item.getAttribute('data-id')
        )
        listArray.splice(itemIndex, 1)
        localStorage.setItem('list', JSON.stringify(listArray))
    }

    renderItem() {
        let newSection = document.createElement('section')
        newSection.classList.add('list-item')
        newSection.setAttribute('data-id', this.listId)
        newSection.setAttribute('data-type', this.type)
        if (this.isDone) {
            newSection.classList.add('--done')

        }

        let content = document.createElement('div')
        content.classList.add('list-item__content')

        let title = document.createElement('h3')
        title.classList.add('list-item__title')
        title.innerText = this.name;
        content.appendChild(title)

        let desc = document.createElement('p')
        desc.classList.add('list-item__desc')
        desc.innerText = this.desc;
        content.appendChild(desc)

        let deadline = document.createElement('time')
        deadline.classList.add('list-item__deadline')
        deadline.innerText = this.deadline;
        content.appendChild(deadline)

        newSection.appendChild(content)
        newSection.appendChild(this.createBtn('list-item__mark', 'done', this.doneItem))
        newSection.appendChild(this.createBtn('list-item__edit', 'edit', this.startEditItem))
        newSection.appendChild(this.createBtn('list-item__remove', 'delete', this.removeItem))

        List.appendChild(newSection)
    }

    doneItem(target) {
        let item = target.closest('.list-item')
        item.classList.toggle('--done')
        let itemInArray = listArray.find(
            (todo) => +todo.listId === +item.getAttribute('data-id')
        )
        itemInArray.isDone = !itemInArray.isDone

        console.log(listArray)
        localStorage.setItem('list', JSON.stringify(listArray))

    }

    createBtn(btnClass, btnIcon, callback) {
        let btn = document.createElement('button')
        btn.classList.add('list-item__btn', btnClass)
        btn.onclick = function () {
            callback(event.target)
        }

        let icon = document.createElement('span')
        icon.classList.add('material-symbols-outlined')
        icon.innerText = btnIcon
        btn.appendChild(icon)

        return btn
    }
}

/* modules/Task.js */
class Task extends ListItem {
    constructor(name, desc, deadline, isDone, assignee) {
        super('task', name, desc, deadline, isDone);
        this.assignee = assignee
    }
}

/* modules/Purchase.js */
class Purchase extends ListItem {
    constructor(name, desc, deadline, isDone, quantity) {
        super('purchase', name, desc, deadline, isDone);
        this.quantity = quantity
    }
}

createForm.onsubmit = function (event) {
    event.preventDefault();
    const inputs = event.target.elements

    if (inputs.name.value.length >= 5 && inputs.deadline.value) {
        let item

        if (editIndex >= 0) {
            item = document.querySelector(`[data-id="${editIndex}"]`)

            // Оновити старі дані за допомогою InnerText
            item.querySelector('h3').innerText = inputs.name.value
            item.querySelector('p').innerText = inputs.desc.value
            item.querySelector('time').innerText = inputs.deadline.value
            item.setAttribute('data-type', inputs.type.value)

            let indexToUpdate = listArray.findIndex((item) => +item.listId === editIndex)
            // Оновити старі дані в масиві
            listArray[indexToUpdate] = {
                ...listArray[editIndex],
                name: inputs.name.value,
                desc: inputs.desc.value,
                deadline: inputs.deadline.value,
                type: inputs.type.value,
            }
            createForm.elements.button.innerText = 'Додати +'
            editIndex = -1;
            item.scrollIntoView({
                alignToTop: true,
                behavior: 'smooth'
            })
        } else {
            if (inputs.type.value === 'task') {
                item = new Task(inputs.name.value, inputs.desc.value, inputs.deadline.value, false)
            } else if (inputs.type.value === 'purchase') {
                item = new Purchase(inputs.name.value, inputs.desc.value, inputs.deadline.value, false)
            }
            item.addItem()
        }
        localStorage.setItem('list', JSON.stringify(listArray))
        event.target.reset()
    } else {
        alert('fill all required fields')
    }
}


if (JSON.parse(localStorage.getItem('list'))?.length) {
    JSON.parse(localStorage.getItem('list')).forEach(item => {
        let newItem;
        if (item.type === 'task') {
            newItem = new Task(item.name, item.desc, item.deadline, item.isDone)
        } else if (item.type === 'purchase') {
            newItem = new Purchase(item.name, item.desc, item.deadline, item.isDone)
        }
        newItem.addItem()
    })
} else {
    localStorage.setItem('list', JSON.stringify(listArray))
}

/* Services */
function formatNumber(num) {
    return num < 9 ? `0${num}` : num
}

function formatDate(year, month, day) {
    let lang = 'ua'
    if (lang === 'ua') {
        return `${year}-${formatNumber(month + 1)}-${formatNumber(day)}`
    } else if (lang === 'en') {
        return `${formatNumber(day)}-${formatNumber(month + 1)}-${year}`
    }
}


// sessionStorage.setItem('test', 'test 12312')