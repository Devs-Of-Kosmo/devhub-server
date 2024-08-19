package team.devs.devhub.domain.team.dto.project;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class TeamProjectInitRequest {

    private Long projectId;
    private List<MultipartFile> files;
    private String commitMessage;
}
