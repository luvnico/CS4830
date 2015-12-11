package gbasic

class HelloController {

    def index() { 
		def list = []
		list << new Person(firstName: 'John', lastName:'Doe', age:50)
		list << new Person(firstName: 'Jane', lastName:'Smith', age:45)
		list << new Person(firstName: 'Sam', lastName:'Robinson', age:47)
		[ list:list ]
	}
	
	def displayForm() {
		// just provide value for age. First Name and Last name are blanks.
		Person person = new Person(age:55)
		[ person:person ]
	}
}
