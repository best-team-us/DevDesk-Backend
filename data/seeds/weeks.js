const bcrypt = require('bcryptjs');

exports.seed = function(knex) {
      return knex('weeks').insert([
            {
                id: 1,
                number: 1,
                unit_id: 1,
                name: 'Web Fundamentals',
                description: 'The goal of this sprint is to build user interfaces and introduce git into our work flow. Concepts covered: Semantic HTML, box model, display types, layout techniques, flex box, basic terminal use, basic git use.',
                url: 'https://learn.lambdaschool.com/web1/sprint/recfwZvI7QhMa7xbG',
            },
            {
                id: 2,
                number: 2,
                unit_id: 1,
                name: 'Advanced CSS',
                description: 'Responsive design pushes our basic CSS styling forward into thousands of devices. A growing trend in today’s markets continue to be mobile devices that range from large tablets to small screens. You need to be able to correctly deliver content to all of these mediums.',
                url: 'https://learn.lambdaschool.com/web1/sprint/recIXiQgpgMdJ81ms',
            },
            {
                id: 3,
                number: 3,
                unit_id: 1,
                name: 'JavaScript Fundamentals',
                description: 'One of the most powerful web languages is JavaScript. Without it, there is no web. All web browsers use JavaScript in some fashion to power rich user experiences for those interacting with a web page or application.',
                url: 'https://learn.lambdaschool.com/web1/sprint/recclZwJxMU8kUngT',
            },
            {
                id: 4,
                number: 4,
                unit_id: 1,
                name: 'Unit 1 Build Week',
                description: '',
                url: '',
            },
            {
                id: 5,
                number: 1,
                unit_id: 2,
                name: 'Applied JavaScript',
                description: 'This week is all about exposing you to applying your Javascript knowledge to the Document Object Model and creating rich Javascript user interfaces.',
                url: 'https://learn.lambdaschool.com/web2/sprint/recPSZMPrmESUYo2C',
            },
            {
                id: 6,
                number: 2,
                unit_id: 2,
                name: 'Intro to React',
                description: 'React is a UI library that is used in various forms to create complex, rich user interfaces.',
                url: 'https://learn.lambdaschool.com/web2/sprint/recYL2HDPPpkDmGEm',
            },
            {
                id: 7,
                number: 3,
                unit_id: 2,
                name: 'Single Page Applications',
                description: 'This week we’ll be learning about using two very useful packages with React: React Router and Formik. With the UI Library (React), the Client Side Routing Library (React Router), and the Form library Formik, you’ll be able to craft rich, robust and highly scale-able Single Page Applications.',
                url: 'https://learn.lambdaschool.com/web2/sprint/recRT8JKvbTiGaosk',
            },
            {
                id: 8,
                number: 4,
                unit_id: 3,
                name: 'Unit 2 Build Week',
                description: '',
                url: '',
            },
            {
                id: 9,
                number: 1,
                unit_id: 3,
                name: 'Advanced React',
                description: '',
                url: 'https://learn.lambdaschool.com/web3/sprint/recq59MvEIZfUAohy',
            },
            {
                id: 10,
                number: 2,
                unit_id: 3,
                name: 'Advanced State Management',
                description: '',
                url: 'https://learn.lambdaschool.com/web3/sprint/recukritK1B1pFrcM',
            },
            {
                id: 11,
                number: 3,
                unit_id: 3,
                name: 'Advanced Web Applications',
                description: '',
                url: 'https://learn.lambdaschool.com/web3/sprint/recnhsJGy28gNi1K5',
            },
            {
                id: 12,
                number: 4,
                unit_id: 3,
                name: 'Unit 3 Build Week',
                description: '',
                url: '',
            },
            // {
            //     id: 10,
            //     number: 3,
            //     unit_id: 3,
            //     name: '',
            //     description: '',
            //     url: '',
            // },
        ]
    )
};