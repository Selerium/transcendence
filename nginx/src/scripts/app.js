let loggedIn = false;

async function fillData(str) {
  if (!loggedIn) {
	loggedIn = true;
	let info = await fetch("http://localhost:8080/api/me", {
		method: "GET",
		credentials: "include",
	  })
		.then((response) => {
		  return response.json();
		})
		.catch((err) => {
		  return err;
		});

	let username = info['data']['username'];
	let image_url = info['data']['profile_pic'];

	const doc_nav_username = document.getElementById('nav-profile');
	const doc_nav_image = document.getElementById('nav-image');
	doc_nav_username.innerHTML = username;
	doc_nav_image.src = image_url;
  }
  if (str == "/profile") {
    let info = await fetch("http://localhost:8080/api/me", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        return err;
      });

    let username = info['data']['username'];
    let image_url = info['data']['profile_pic'];

	const doc_username = document.getElementById('profile-username');
	const doc_role = document.getElementById('profile-role');
	const doc_image = document.getElementById('profile-image');
	doc_username.innerHTML = username;
	doc_role.innerHTML = 'student';
	doc_image.src = image_url;
  }
}
